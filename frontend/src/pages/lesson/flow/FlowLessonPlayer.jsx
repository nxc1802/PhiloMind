import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateComponentProgressMutation } from "../../../hooks/useMutations";
import { parseMarkdownToReact } from "../components/MarkdownRenderer";
import DialogueSequence from "../components/GuideSpeech";
import { VideoScene } from "../adventure/components/AdventureCommon";

function getProgress(progress) {
  return Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
}

function normalizeOptions(options = []) {
  return options.map((option, index) => ({
    id: option.id || option.answerId || `option_${index}`,
    text: option.text,
    isCorrect: option.isCorrect === true || option.correct === true,
    explanation: option.explanation,
  }));
}

function normalizeFlow(rawFlow) {
  if (!Array.isArray(rawFlow)) return [];

  return rawFlow
    .filter((component) => component && typeof component === "object")
    .map((component, index) => ({
      ...component,
      id: component.id || `component_${index}`,
      type: component.type || "unsupported",
      title: component.title || "Hoạt động bài học",
      config:
        component.config && typeof component.config === "object"
          ? component.config
          : {},
    }));
}

function ComponentFrame({ component, children }) {
  const safeComponent = component || {};
  const typeLabel = String(safeComponent.type || "lesson_flow").replaceAll(
    "_",
    " ",
  );
  const typeIcon =
    {
      media: "play_circle",
      dialogue: "forum",
      markdown: "menu_book",
      mcq: "quiz",
      multi_select: "checklist",
      true_false: "rule",
      matching_columns: "conversion_path",
      category_sorting: "category",
      target_matching: "ads_click",
      mindmap_reveal: "hub",
      sequence_sorting: "format_list_numbered",
      final_summary: "military_tech",
    }[safeComponent.type] || "widgets";

  return (
    <section className="bg-white text-slate-900 dark:bg-[#0f2530] dark:text-primary-100 rounded-2xl shadow-md border border-slate-200 dark:border-primary-800 p-4 md:p-6 text-left">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-650 dark:bg-primary-900/35 dark:text-primary-300">
          {typeIcon}
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-primary-650 dark:text-primary-300 font-bold">
            {typeLabel}
          </p>
          <h2 className="text-xl font-bold text-primary-900 dark:text-primary-100 leading-tight">
            {safeComponent.title || "Hoạt động bài học"}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function LessonHint({ title = "Cách chơi", steps = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-650 dark:border-primary-850 dark:bg-primary-950/25 dark:text-primary-150">
        <div className="flex min-w-0 items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary-600 dark:text-primary-300">
            tips_and_updates
          </span>
          <p className="min-w-0 leading-relaxed">
            {steps[0] || "Hoàn thành tương tác để tiếp tục bài học."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800 bg-white dark:bg-primary-950/50 px-3 py-1.5 text-xs font-bold text-primary-800 dark:text-primary-100 hover:border-primary-500"
        >
          <span className="material-symbols-outlined text-base">help</span>
          Cách chơi
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 dark:border-primary-850 bg-white dark:bg-[#102733] p-6 text-slate-800 dark:text-primary-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng hướng dẫn"
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-primary-900/40 dark:hover:text-primary-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="mb-2 flex items-center gap-2 pr-8 text-xl font-bold text-primary-850 dark:text-primary-100">
              <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">
                tips_and_updates
              </span>
              {title}
            </h3>
            <p className="mb-5 text-sm text-slate-500 dark:text-primary-250">
              Làm theo từng bước bên dưới trước khi bắt đầu tương tác.
            </p>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-primary-100 dark:border-primary-850 bg-primary-50 dark:bg-[#15313e] p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm font-semibold leading-relaxed text-slate-700 dark:text-primary-100">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-3xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-750"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ContinueButton({ onComplete, label = "Hoàn thành bước này" }) {
  return (
    <div className="mt-5 flex justify-end">
      <button
        type="button"
        onClick={() => onComplete({ score: 100, status: "completed" })}
        className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
      >
        {label}
        <span className="material-symbols-outlined text-base">
          arrow_forward
        </span>
      </button>
    </div>
  );
}

function MediaComponent({ component, onComplete }) {
  const { config } = component;
  const mediaType = config.mediaType || "video";
  return (
    <ComponentFrame component={component}>
      {mediaType === "image" ? (
        <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-primary-850 dark:bg-primary-950/30">
          <img
            src={config.url}
            alt={config.alt || config.title || component.title}
            className="max-h-[520px] w-full object-contain"
          />
          {(config.title || config.subtitle) && (
            <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-primary-850 dark:text-primary-200">
              {config.title && (
                <p className="font-bold text-slate-900 dark:text-primary-100">
                  {config.title}
                </p>
              )}
              {config.subtitle && <p>{config.subtitle}</p>}
            </figcaption>
          )}
        </figure>
      ) : (
        <VideoScene
          src={config.url}
          badge={config.badge}
          title={config.title || component.title}
          subtitle={config.subtitle}
        />
      )}
      {config.description && (
        <p className="text-gray-700 dark:text-primary-150 leading-relaxed">
          {config.description}
        </p>
      )}
      <ContinueButton onComplete={onComplete} label="Tôi đã xem xong" />
    </ComponentFrame>
  );
}

function DialogueComponent({ component, onComplete }) {
  const lines = (component.config.lines || component.config.dialogs || []).map(
    (line) => ({
      who: line.who || "guide",
      text: line.text,
    }),
  );
  return (
    <ComponentFrame component={component}>
      <div className="bg-gray-50 dark:bg-primary-950/30 rounded-3xl border border-gray-200 dark:border-primary-850 p-5">
        <DialogueSequence
          lines={lines}
          onComplete={() => onComplete({ score: 100, status: "completed" })}
          ctaLabel="Tiếp tục"
        />
      </div>
    </ComponentFrame>
  );
}

function MarkdownComponent({ component, onComplete }) {
  return (
    <ComponentFrame component={component}>
      <article className="prose max-w-none text-gray-800 dark:text-primary-100">
        {parseMarkdownToReact(component.config.content || "")}
      </article>
      <ContinueButton onComplete={onComplete} />
    </ComponentFrame>
  );
}

function McqComponent({ component, onComplete }) {
  const options = normalizeOptions(component.config.options);
  const [selectedId, setSelectedId] = useState(null);
  const [wrongIds, setWrongIds] = useState([]);
  const selected = options.find((option) => option.id === selectedId);
  const solved = selected?.isCorrect;

  const handlePick = (option) => {
    if (solved) return;
    setSelectedId(option.id);
    if (!option.isCorrect && !wrongIds.includes(option.id)) {
      setWrongIds((prev) => [...prev, option.id]);
    }
  };

  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-primary-100">
        {component.config.question}
      </p>
      <div className="space-y-2.5">
        {options.map((option) => {
          const wrong = wrongIds.includes(option.id);
          const correctVisible = solved && option.isCorrect;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePick(option)}
              className={`w-full text-left rounded-3xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ${
                correctVisible
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold"
                  : wrong
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 font-semibold"
                    : "border-gray-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100"
              }`}
            >
              <span className="material-symbols-outlined text-xl shrink-0">
                {correctVisible
                  ? "check_circle"
                  : wrong
                    ? "cancel"
                    : "radio_button_unchecked"}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
      {selected && (
        <div
          className={`mt-4 border p-4 rounded-3xl ${solved ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300" : "bg-primary-50 dark:bg-primary-900/35 border-primary-200 dark:border-primary-800 text-primary-850 dark:text-primary-150"}`}
        >
          <p
            className={`font-bold flex items-center gap-2 mb-1 ${solved ? "text-green-800" : "text-primary-700 dark:text-primary-250"}`}
          >
            <span className="material-symbols-outlined text-base">
              {solved ? "lightbulb" : "error"}
            </span>
            {solved ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-primary-100">
            {selected.explanation ||
              (solved
                ? component.feedback?.correct
                : component.feedback?.incorrect) ||
              component.config.explanation}
          </p>
          {solved && (
            <ContinueButton
              onComplete={() =>
                onComplete({
                  score: 100,
                  attempts: wrongIds.length + 1,
                  answer: selectedId,
                  status: "completed",
                })
              }
              label="Tiếp tục"
            />
          )}
        </div>
      )}
    </ComponentFrame>
  );
}

function MultiSelectComponent({ component, onComplete }) {
  const options = normalizeOptions(component.config.options);
  const correctIds = options
    .filter((option) => option.isCorrect)
    .map((option) => option.id)
    .sort();
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const sortedSelected = [...selectedIds].sort();
  const solved =
    submitted &&
    correctIds.length === sortedSelected.length &&
    correctIds.every((id, index) => id === sortedSelected[index]);

  const toggle = (optionId) => {
    if (solved) return;
    setSubmitted(false);
    setSelectedIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  return (
    <ComponentFrame component={component}>
      <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-primary-100">
        {component.config.question}
      </p>
      <div className="grid gap-3">
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          const showCorrect = submitted && option.isCorrect;
          const showWrong = submitted && checked && !option.isCorrect;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left font-medium transition-all ${
                showCorrect
                  ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200"
                  : showWrong
                    ? "border-red-400 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-200"
                    : checked
                      ? "border-primary-600 bg-primary-50 text-primary-900 shadow-sm dark:bg-primary-900/40 dark:text-primary-100"
                      : "border-slate-250 bg-white text-slate-750 hover:border-primary-400 hover:bg-primary-50 dark:bg-[#132d39] dark:text-primary-150 dark:hover:bg-primary-900/25"
              }`}
            >
              <span className="material-symbols-outlined mt-0.5 text-xl">
                {checked ? "check_box" : "check_box_outline_blank"}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div
          className={`mt-4 rounded-2xl border p-4 ${
            solved
              ? "border-green-200 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100"
              : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
          }`}
        >
          <p className="font-bold">
            {solved ? "Chính xác" : "Chưa đủ chính xác"}
          </p>
          {component.config.explanation && (
            <p className="mt-1 text-sm leading-relaxed">
              {component.config.explanation}
            </p>
          )}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        {!solved ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-3xl bg-primary-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kiểm tra
            <span className="material-symbols-outlined text-base">
              task_alt
            </span>
          </button>
        ) : (
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: selectedIds,
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        )}
      </div>
    </ComponentFrame>
  );
}

function TrueFalseComponent({ component, onComplete }) {
  const [picked, setPicked] = useState(null);
  const correct = picked === component.config.correctAnswer;
  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg text-gray-900 dark:text-primary-100 mb-4">
        {component.config.statement}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setPicked(value)}
            className={`rounded-3xl border-2 px-5 py-4 font-bold transition-colors ${
              picked === value
                ? value === component.config.correctAnswer
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300"
                  : "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300"
                : "border-slate-205 bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            }`}
          >
            {value ? "Đúng" : "Sai"}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div
          className={`mt-4 rounded-3xl border p-4 ${correct ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300"}`}
        >
          <p
            className={`font-bold ${correct ? "text-green-800" : "text-red-800"}`}
          >
            {correct ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="text-sm text-slate-800 dark:text-primary-100 leading-relaxed mt-1">
            {component.config.explanation}
          </p>
          {correct && (
            <ContinueButton
              onComplete={() =>
                onComplete({ score: 100, answer: picked, status: "completed" })
              }
              label="Tiếp tục"
            />
          )}
        </div>
      )}
    </ComponentFrame>
  );
}

function MatchingColumnsComponent({ component, onComplete }) {
  const {
    leftColumn = [],
    rightColumn = [],
    correctPairs = [],
  } = component.config;
  const [activeLeft, setActiveLeft] = useState(null);
  const [pairs, setPairs] = useState({});
  const expected = Object.fromEntries(
    correctPairs.map((pair) => [pair.leftId, pair.rightId]),
  );
  const rightById = Object.fromEntries(
    rightColumn.map((right) => [right.id, right]),
  );
  const leftById = Object.fromEntries(
    leftColumn.map((left) => [left.id, left]),
  );
  const pairedRightIds = new Set(Object.values(pairs));
  const complete =
    leftColumn.length > 0 &&
    leftColumn.every((left) => pairs[left.id] === expected[left.id]);

  const chooseRight = (rightId) => {
    if (!activeLeft) return;
    setPairs((prev) => ({ ...prev, [activeLeft]: rightId }));
    setActiveLeft(null);
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Chọn một khái niệm ở cột trái.",
          "Chọn định nghĩa tương ứng ở cột phải.",
          "Quan sát đường nối và sửa lại nếu cặp chưa đúng.",
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-slate-100 dark:bg-[#15313e] text-slate-700 dark:text-primary-100 px-3 py-1">
          Đã nối {Object.keys(pairs).length}/{leftColumn.length}
        </span>
        {activeLeft && (
          <span className="rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-100 px-3 py-1">
            Đang chọn: {leftById[activeLeft]?.text}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] gap-3 md:gap-4">
        <div className="space-y-2">
          {leftColumn.map((left) => (
            <button
              key={left.id}
              type="button"
              onClick={() => setActiveLeft(left.id)}
              className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all ${
                activeLeft === left.id
                  ? "border-primary-600 bg-primary-100 dark:bg-primary-900/60 text-primary-950 dark:text-white shadow-md"
                  : pairs[left.id] === expected[left.id]
                    ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-100"
                    : pairs[left.id]
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100"
                      : "border-slate-250 bg-white dark:bg-[#132d39] text-slate-800 dark:text-primary-100 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/35"
              }`}
            >
              <span className="flex items-start gap-3">
                <span className="material-symbols-outlined text-lg shrink-0">
                  {pairs[left.id] === expected[left.id]
                    ? "check_circle"
                    : activeLeft === left.id
                      ? "radio_button_checked"
                      : "radio_button_unchecked"}
                </span>
                <span>{left.text}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex flex-col justify-around py-1">
          {leftColumn.map((left) => {
            const paired = pairs[left.id];
            const correct = paired && paired === expected[left.id];
            return (
              <div
                key={left.id}
                className="flex items-center justify-center gap-1"
              >
                <span
                  className={`h-1.5 w-10 rounded-full ${paired ? (correct ? "bg-green-500" : "bg-amber-500") : "bg-slate-250 dark:bg-primary-850"}`}
                />
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    paired
                      ? correct
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-250 bg-white dark:bg-[#132d39] text-slate-400"
                  }`}
                >
                  {paired ? "→" : "•"}
                </span>
                <span
                  className={`h-1.5 w-10 rounded-full ${paired ? (correct ? "bg-green-500" : "bg-amber-500") : "bg-slate-250 dark:bg-primary-850"}`}
                />
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          {rightColumn.map((right) => (
            <button
              key={right.id}
              type="button"
              onClick={() => chooseRight(right.id)}
              className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-medium transition-all ${
                pairedRightIds.has(right.id)
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 text-primary-900 dark:text-primary-100"
                  : activeLeft
                    ? "border-primary-300 bg-white dark:bg-[#132d39] text-slate-800 dark:text-primary-100 hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/35"
                    : "border-slate-250 bg-white dark:bg-[#132d39] text-slate-700 dark:text-primary-150 hover:border-primary-400"
              }`}
            >
              <span className="flex items-start gap-3">
                <span className="material-symbols-outlined text-lg shrink-0">
                  {pairedRightIds.has(right.id) ? "link" : "notes"}
                </span>
                <span>{right.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {Object.keys(pairs).length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 dark:border-primary-850 bg-slate-50 dark:bg-[#102733] p-4">
          <p className="mb-3 text-sm font-bold text-slate-800 dark:text-primary-100">
            Các đường nối đã chọn
          </p>
          <div className="grid gap-2">
            {Object.entries(pairs).map(([leftId, rightId]) => {
              const correct = rightId === expected[leftId];
              return (
                <div
                  key={leftId}
                  className={`flex flex-col gap-2 rounded-xl border px-3 py-2 text-sm sm:flex-row sm:items-center ${
                    correct
                      ? "border-green-200 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100"
                      : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
                  }`}
                >
                  <span className="font-semibold">
                    {leftById[leftId]?.text}
                  </span>
                  <span className="hidden h-px flex-1 bg-current opacity-30 sm:block" />
                  <span className="font-semibold">
                    {rightById[rightId]?.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold">Các cặp nối đã chính xác.</p>
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: pairs, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}

function CategorySortingComponent({ component, onComplete }) {
  const { categories = [], cards = [], summary } = component.config;
  const [selectedCard, setSelectedCard] = useState(null);
  const [placements, setPlacements] = useState({});
  const complete =
    cards.length > 0 &&
    cards.every((card) => placements[card.id] === card.categoryId);

  const placeCard = (categoryId) => {
    if (!selectedCard) return;
    setPlacements((prev) => ({ ...prev, [selectedCard]: categoryId }));
    setSelectedCard(null);
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Bấm vào một thẻ tình huống/khái niệm.",
          "Bấm vào nhóm phù hợp để đặt thẻ.",
          "Thẻ xanh là đúng, thẻ đỏ là cần chuyển lại.",
        ]}
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-800 dark:text-primary-100">
          Thẻ cần phân loại
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-650 dark:bg-primary-900/40 dark:text-primary-150">
          Đã đặt {Object.keys(placements).length}/{cards.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {cards.map((card) => {
          const placed = placements[card.id];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCard(card.id)}
              className={`px-4 py-2 rounded-3xl border-2 font-semibold ${
                selectedCard === card.id
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/40 text-primary-850 dark:text-primary-100 font-semibold shadow-sm"
                  : placed === card.categoryId
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold"
                    : placed
                      ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 font-semibold"
                      : "border-slate-205 bg-white dark:bg-surface-dark-elevated text-gray-750 dark:text-primary-150 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              }`}
            >
              {card.text}
            </button>
          );
        })}
      </div>
      <p className="mb-3 text-sm font-bold text-slate-800 dark:text-primary-100">
        Vùng nhận thẻ
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const placedCards = cards.filter(
            (card) => placements[card.id] === category.id,
          );
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => placeCard(category.id)}
              className="min-h-36 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-[#132d39] px-4 py-4 text-left hover:border-primary-500 transition-colors"
            >
              <p className="font-bold text-primary-850 dark:text-primary-100">
                {category.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {placedCards.length > 0 ? (
                  placedCards.map((card) => (
                    <span
                      key={card.id}
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        card.categoryId === category.id
                          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/35 dark:text-green-200"
                          : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/35 dark:text-red-200"
                      }`}
                    >
                      {card.text}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-primary-250">
                    Chưa có thẻ
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold">Phân loại chính xác.</p>
          {summary && <p className="text-sm mt-1">{summary}</p>}
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: placements,
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}

function TargetMatchingComponent({ component, onComplete }) {
  const { targets = [], items = [], summary } = component.config;
  const [selectedItem, setSelectedItem] = useState(null);
  const [placements, setPlacements] = useState({});
  const complete =
    items.length > 0 &&
    items.every((item) => placements[item.id] === item.targetId);

  const placeItem = (targetId) => {
    if (!selectedItem) return;
    setPlacements((prev) => ({ ...prev, [selectedItem]: targetId }));
    setSelectedItem(null);
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Chọn một thuật ngữ ở hàng trên.",
          "Đưa thuật ngữ vào vùng/đích tương ứng.",
          "Có thể chọn lại thuật ngữ để sửa vị trí.",
        ]}
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-800 dark:text-primary-100">
          Thuật ngữ cần ghép
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-650 dark:bg-primary-900/40 dark:text-primary-150">
          Đã đặt {Object.keys(placements).length}/{items.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item.id)}
            className={`px-4 py-2 rounded-3xl border-2 font-bold text-lg ${
              selectedItem === item.id
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/40 text-primary-850 dark:text-primary-100 font-semibold shadow-sm"
                : placements[item.id] === item.targetId
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold"
                  : "border-slate-205 bg-white dark:bg-surface-dark-elevated text-gray-750 dark:text-primary-150 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {targets.map((target) => {
          const placedItems = items.filter(
            (item) => placements[item.id] === target.id,
          );
          return (
            <button
              key={target.id}
              type="button"
              onClick={() => placeItem(target.id)}
              className="min-h-40 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-[#14313f] dark:to-[#102733] px-4 py-5 text-center hover:border-primary-500 text-slate-800 dark:text-primary-100 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl text-primary-650 dark:text-primary-300">
                {target.icon || "public"}
              </span>
              <p className="font-bold text-primary-900 dark:text-primary-100">
                {target.label}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {placedItems.length > 0 ? (
                  placedItems.map((item) => (
                    <span
                      key={item.id}
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        item.targetId === target.id
                          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/35 dark:text-green-200"
                          : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/35 dark:text-red-200"
                      }`}
                    >
                      {item.text}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-primary-250">
                    Chưa có thuật ngữ
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold">Bản đồ thuật ngữ đã hoàn chỉnh.</p>
          {summary && <p className="text-sm mt-1">{summary}</p>}
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: placements,
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}

function MindmapRevealComponent({ component, onComplete }) {
  const nodes = component.config.nodes || [];
  const [revealed, setRevealed] = useState([]);
  const complete = nodes.length > 0 && revealed.length === nodes.length;

  return (
    <ComponentFrame component={component}>
      <div className="text-center mb-5">
        <span className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-600 text-white font-bold shadow-lg">
          {component.config.center || "Triết học"}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {nodes.map((node) => {
          const open = revealed.includes(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() =>
                setRevealed((prev) =>
                  prev.includes(node.id) ? prev : [...prev, node.id],
                )
              }
              className={`rounded-3xl border-2 p-4 text-left min-h-28 transition-colors ${
                open
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100"
                  : "border-slate-205 bg-white dark:bg-surface-dark-elevated text-gray-750 dark:text-primary-150 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              }`}
            >
              <p className="font-bold text-primary-900 dark:text-primary-100">
                {open ? node.label : "Mảnh ghép chưa mở"}
              </p>
              <p className="text-sm text-gray-600 dark:text-primary-200 mt-2">
                {open ? node.detail : "Bấm để lật mở nội dung."}
              </p>
            </button>
          );
        })}
      </div>
      {complete && (
        <ContinueButton
          onComplete={() =>
            onComplete({ score: 100, answer: revealed, status: "completed" })
          }
          label="Tiếp tục"
        />
      )}
    </ComponentFrame>
  );
}

function SequenceSortingComponent({ component, onComplete }) {
  const items = component.config.items || [];
  const [placed, setPlaced] = useState([]);
  const [lastWrongId, setLastWrongId] = useState(null);
  const complete = items.length > 0 && placed.length === items.length;

  const pick = (item) => {
    if (placed.includes(item.id)) return;
    if (
      (item.order ?? items.findIndex((it) => it.id === item.id)) ===
      placed.length
    ) {
      setPlaced((prev) => [...prev, item.id]);
      setLastWrongId(null);
    } else {
      setLastWrongId(item.id);
    }
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Đọc yêu cầu và tìm bước đầu tiên.",
          "Bấm các thẻ theo đúng trình tự.",
          "Thẻ đã chọn đúng sẽ chuyển vào dòng thời gian.",
        ]}
      />
      {component.config.instruction && (
        <p className="text-sm font-medium text-slate-600 dark:text-primary-200 mb-4">
          {component.config.instruction}
        </p>
      )}
      <div className="space-y-2 mb-4">
        {placed.map((id, index) => {
          const item = items.find((it) => it.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border-2 border-green-400 dark:border-green-800 bg-green-50 dark:bg-green-950/35 px-4 py-3"
            >
              <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-sm text-green-950 dark:text-green-100 font-medium">
                {item?.text}
              </span>
            </div>
          );
        })}
      </div>
      {!complete && (
        <div className="grid sm:grid-cols-2 gap-3">
          {items
            .filter((item) => !placed.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                  lastWrongId === item.id
                    ? "border-red-400 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                    : "border-slate-250 bg-white text-slate-800 hover:border-primary-400 hover:bg-primary-50 dark:border-primary-850 dark:bg-[#132d39] dark:text-primary-100 dark:hover:bg-primary-900/35"
                }`}
              >
                {item.text}
              </button>
            ))}
        </div>
      )}
      {lastWrongId && !complete && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
          Chưa đúng thứ tự. Hãy chọn mắt xích logic tiếp theo trong chuỗi.
        </p>
      )}
      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold">
            {component.config.successFeedback || "Sắp xếp chính xác."}
          </p>
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: placed, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}

function FinalSummaryComponent({ component, onComplete }) {
  const {
    message,
    keyTakeaways = [],
    rewards = {},
    quiz = [],
  } = component.config;
  const [quizDone, setQuizDone] = useState(quiz.length === 0);
  const [answers, setAnswers] = useState({});
  const answeredAll =
    quiz.length > 0 && quiz.every((_, index) => answers[index] !== undefined);
  const score =
    quiz.length === 0
      ? 100
      : Math.round(
          (quiz.filter((q, index) => answers[index] === q.correctIndex).length /
            quiz.length) *
            100,
        );

  useEffect(() => {
    if (answeredAll) setQuizDone(true);
  }, [answeredAll]);

  return (
    <ComponentFrame component={component}>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-primary-950/60 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 text-slate-900 dark:text-amber-50">
        <p className="text-lg font-bold text-primary-950 dark:text-amber-50 mb-2">
          {message || "Bạn đã hoàn thành bài học."}
        </p>
        <ul className="space-y-2">
          {keyTakeaways.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-slate-800 dark:text-amber-50"
            >
              <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">
                check_circle
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#182d35] px-4 py-2 text-sm font-bold text-amber-800 dark:text-amber-100 border border-amber-200 dark:border-amber-800">
          <span className="material-symbols-outlined text-base">
            military_tech
          </span>
          {rewards.badge || "Hoàn thành"} · {rewards.xp || 100} XP
        </div>
      </div>

      {quiz.length > 0 && (
        <div className="mt-5 space-y-4">
          {quiz.map((question, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 dark:border-primary-850 bg-white dark:bg-[#132d39] p-4"
            >
              <p className="font-semibold text-slate-900 dark:text-primary-100 mb-3">
                {question.question}
              </p>
              <div className="grid gap-2">
                {(question.options || []).map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                    }
                    className={`rounded-3xl border px-4 py-2 text-left ${
                      answers[index] === optionIndex
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/40 text-primary-850 dark:text-primary-100 font-bold shadow-sm"
                        : "border-gray-250 bg-white dark:bg-surface-dark-elevated text-gray-750 dark:text-primary-150 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quizDone && (
            <p className="text-sm font-bold text-green-700 dark:text-green-300">
              Điểm tổng kết: {score}%
            </p>
          )}
        </div>
      )}

      {quizDone && (
        <ContinueButton
          onComplete={() =>
            onComplete({ score, answer: answers, status: "completed" })
          }
          label="Hoàn thành bài học"
        />
      )}
    </ComponentFrame>
  );
}

const registry = {
  media: MediaComponent,
  dialogue: DialogueComponent,
  markdown: MarkdownComponent,
  mcq: McqComponent,
  multi_select: MultiSelectComponent,
  true_false: TrueFalseComponent,
  matching_columns: MatchingColumnsComponent,
  category_sorting: CategorySortingComponent,
  target_matching: TargetMatchingComponent,
  mindmap_reveal: MindmapRevealComponent,
  sequence_sorting: SequenceSortingComponent,
  final_summary: FinalSummaryComponent,
};

export default function FlowLessonPlayer({
  nodeDetails,
  isRevisit,
  onComplete,
}) {
  const { user } = useAuth();
  const progress = getProgress(nodeDetails?.progress);
  const flow = useMemo(
    () => normalizeFlow(nodeDetails?.lessonFlow),
    [nodeDetails?.lessonFlow],
  );
  const initialIndex = isRevisit
    ? 0
    : Math.min(
        progress?.currentComponentIndex || 0,
        Math.max(flow.length - 1, 0),
      );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState(() =>
    Array.isArray(progress?.completedComponentIds)
      ? progress.completedComponentIds
      : [],
  );
  const updateComponentProgress = useUpdateComponentProgressMutation();

  useEffect(() => {
    setActiveIndex(initialIndex);
    setCompletedIds(
      Array.isArray(progress?.completedComponentIds)
        ? progress.completedComponentIds
        : [],
    );
  }, [nodeDetails?.id]);

  if (!flow.length) {
    return (
      <ComponentFrame
        component={{
          type: "lesson_flow",
          title: "Bài học chưa có nội dung",
          config: {},
        }}
      >
        <p className="text-gray-600">
          Lesson Flow chưa được cấu hình cho bài học này.
        </p>
      </ComponentFrame>
    );
  }

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), flow.length - 1);
  const activeComponent = flow[safeActiveIndex];
  const Renderer = registry[activeComponent.type];
  const completedCount = Math.min(new Set(completedIds).size, flow.length);
  const percentage = Math.round((completedCount / flow.length) * 100);

  const markComplete = (result = {}) => {
    const nextCompletedIds = completedIds.includes(activeComponent.id)
      ? completedIds
      : [...completedIds, activeComponent.id];
    const nextIndex = Math.min(safeActiveIndex + 1, flow.length - 1);
    const componentResult = {
      componentId: activeComponent.id,
      type: activeComponent.type,
      status: "completed",
      ...result,
    };

    setCompletedIds(nextCompletedIds);

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: flow[nextIndex]?.id,
        currentComponentIndex: nextIndex,
        completedComponentIds: nextCompletedIds,
        componentResult,
      },
    });

    if (safeActiveIndex >= flow.length - 1) {
      onComplete?.();
      return;
    }
    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-md border border-gray-200 dark:border-primary-850/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
              Component Flow
            </p>
            <p className="font-bold text-primary-850 dark:text-primary-100">
              Bước {safeActiveIndex + 1}/{flow.length}:{" "}
              {activeComponent.title || activeComponent.type}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-600 border border-gray-200 hover:border-primary-600 transition-all"
            title="Về bước đầu"
          >
            <span className="material-symbols-outlined text-lg">
              restart_alt
            </span>
          </button>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {Renderer ? (
        <Renderer
          key={activeComponent.id}
          component={activeComponent}
          onComplete={markComplete}
        />
      ) : (
        <ComponentFrame component={activeComponent}>
          <p className="text-red-700">
            Component type "{activeComponent.type}" chưa có renderer.
          </p>
          <ContinueButton onComplete={markComplete} label="Bỏ qua bước này" />
        </ComponentFrame>
      )}
    </div>
  );
}
