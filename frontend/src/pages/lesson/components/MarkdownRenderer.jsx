import React, { useMemo } from "react";

export function parseInlineMarkdown(text) {
  if (!text) return "";

  // Helper to parse bold inside text/elements
  const parseBold = (str, keyPrefix) => {
    if (typeof str !== "string") return str;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const res = [];
    let lastIdx = 0;
    let match;
    while ((match = boldRegex.exec(str)) !== null) {
      const matchIdx = match.index;
      if (matchIdx > lastIdx) {
        res.push(str.slice(lastIdx, matchIdx));
      }
      res.push(
        <strong key={`${keyPrefix}-bold-${matchIdx}`} className="font-bold text-primary-950">
          {match[1]}
        </strong>
      );
      lastIdx = boldRegex.lastIndex;
    }
    if (lastIdx < str.length) {
      res.push(str.slice(lastIdx));
    }
    return res.length > 0 ? res : str;
  };

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      const textSegment = text.slice(lastIndex, matchIndex);
      const boldSegments = parseBold(textSegment, `seg-${matchIndex}`);
      if (Array.isArray(boldSegments)) {
        parts.push(...boldSegments);
      } else {
        parts.push(boldSegments);
      }
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={`link-${matchIndex}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 dark:text-primary-350 hover:underline font-semibold"
      >
        {parseBold(linkText, `link-text-${matchIndex}`)}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const textSegment = text.slice(lastIndex);
    const boldSegments = parseBold(textSegment, "seg-end");
    if (Array.isArray(boldSegments)) {
      parts.push(...boldSegments);
    } else {
      parts.push(boldSegments);
    }
  }

  return parts.length > 0 ? parts : text;
}

export function parseMarkdownToReact(text) {
  if (!text) return null;
  const lines = text.split("\n").map(line => line.trim());
  const elements = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Check if it is a table line
    if (line.startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }

      // Parse tableLines
      if (tableLines.length >= 1) {
        // Find rows
        const parsedRows = tableLines.map(tLine => {
          // split by | but ignore first and last empty segments
          const cells = tLine.split("|").map(c => c.trim());
          if (cells[0] === "") cells.shift();
          if (cells[cells.length - 1] === "") cells.pop();
          return cells;
        });

        // Determine headers vs body
        let headerRow = null;
        let bodyRows = [];

        // If the second row is a separator row (like |---|---|), then the first row is header
        const hasSeparator = parsedRows[1] && parsedRows[1].every(cell => /^:-*-*:*$/.test(cell) || /^-+$/.test(cell));
        if (hasSeparator) {
          headerRow = parsedRows[0];
          bodyRows = parsedRows.slice(2);
        } else {
          // If no separator, treat first row as header if length > 1, or just all as body
          if (parsedRows.length > 1) {
            headerRow = parsedRows[0];
            bodyRows = parsedRows.slice(1);
          } else {
            bodyRows = parsedRows;
          }
        }

        elements.push(
          <div key={`table-wrapper-${i}`} className="overflow-x-auto my-6 rounded-3xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-250 text-sm">
              {headerRow && (
                <thead className="bg-primary-50 dark:bg-primary-900/35">
                  <tr>
                    {headerRow.map((cell, cellIdx) => (
                      <th
                        key={`th-${cellIdx}`}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-bold text-primary-950 dark:text-primary-200 uppercase tracking-wider border-r border-gray-250/20 last:border-0"
                      >
                        {parseInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="bg-white dark:bg-[#002b37] divide-y divide-gray-200">
                {bodyRows.map((row, rowIdx) => (
                  <tr key={`tr-${rowIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={`td-${cellIdx}`}
                        className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-200/50 last:border-0 font-medium"
                      >
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 1. Heading 1 / Main title (# or 1.)
    if (line.startsWith("# ") || /^\d+\.\s+/.test(line)) {
      const cleanText = line.startsWith("# ") ? line.slice(2) : line;
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-bold text-primary-950 dark:text-primary-100 border-b-2 border-primary-200 dark:border-primary-800/60 pb-2 mt-8 mb-4 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h2>
      );
      i++;
      continue;
    }

    // 2. Heading 2 / Sub-title (## or a) )
    if (line.startsWith("## ") || /^[a-z]\)\s+/.test(line)) {
      const cleanText = line.startsWith("## ") ? line.slice(3) : line;
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg md:text-xl font-bold text-primary-650 dark:text-primary-300 mt-6 mb-3 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h3>
      );
      i++;
      continue;
    }

    // 3. Heading 3 / List bullet title (### or * )
    if (line.startsWith("### ") || line.startsWith("* ")) {
      const cleanText = line.startsWith("### ") ? line.slice(4) : line.slice(2).trim();
      elements.push(
        <div key={`h3-bullet-${i}`} className="flex items-start gap-2.5 mt-5 mb-3 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2.5 shrink-0" />
          <span className="text-base font-bold text-primary-850 dark:text-primary-100">
            {parseInlineMarkdown(cleanText)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // 4. Blockquotes (> )
    if (line.startsWith("> ")) {
      const cleanText = line.slice(2).trim();
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-primary-800 bg-primary-50 dark:bg-primary-900/35 pl-5 pr-3 py-4 my-5 italic text-primary-950 dark:text-primary-200 rounded-r-lg font-serif">
          {parseInlineMarkdown(cleanText)}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-justify text-sm md:text-base">
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return elements;
}
