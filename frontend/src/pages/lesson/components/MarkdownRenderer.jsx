import React from "react";

export function parseInlineMarkdown(text) {
  if (!text) return "";
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    parts.push(
      <strong key={matchIndex} className="font-bold text-primary-950">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export function parseMarkdownToReact(text) {
  if (!text) return null;
  const lines = text.split("\n").map(line => line.trim());
  
  return lines.map((line, index) => {
    if (!line) {
      return <div key={index} className="h-2" />;
    }

    // 1. Heading 1 / Main title (# or 1.)
    if (line.startsWith("# ") || /^\d+\.\s+/.test(line)) {
      const cleanText = line.startsWith("# ") ? line.slice(2) : line;
      return (
        <h2 key={index} className="text-xl md:text-2xl font-bold text-primary-950 border-b-2 border-primary-200 dark:border-primary-800/60 pb-2 mt-8 mb-4 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h2>
      );
    }

    // 2. Heading 2 / Sub-title (## or a) )
    if (line.startsWith("## ") || /^[a-z]\)\s+/.test(line)) {
      const cleanText = line.startsWith("## ") ? line.slice(3) : line;
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-primary-650 dark:text-primary-300 mt-6 mb-3 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h3>
      );
    }

    // 3. Heading 3 / List bullet title (### or * )
    if (line.startsWith("### ") || line.startsWith("* ")) {
      const cleanText = line.startsWith("### ") ? line.slice(4) : line.slice(2).trim();
      return (
        <div key={index} className="flex items-start gap-2.5 mt-5 mb-3 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2.5 shrink-0" />
          <span className="text-base font-bold text-primary-850 dark:text-primary-100">
            {parseInlineMarkdown(cleanText)}
          </span>
        </div>
      );
    }

    // 4. Blockquotes (> )
    if (line.startsWith("> ")) {
      const cleanText = line.slice(2).trim();
      return (
        <blockquote key={index} className="border-l-4 border-primary-800 bg-primary-50 dark:bg-primary-900/35/40 pl-5 pr-3 py-4 my-5 italic text-primary-950 rounded-r-lg font-serif">
          {parseInlineMarkdown(cleanText)}
        </blockquote>
      );
    }

    // 5. Standard paragraph
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify text-sm md:text-base">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}
