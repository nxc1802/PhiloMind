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

function ComponentFrame({ component, children }) {
  return (
    <section className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 dark:border-primary-850 p-5 md:p-6 text-left">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">widgets</span>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-primary-650 dark:text-primary-300 font-bold">
            {component.type.replaceAll("_", " ")}
          </p>
          <h2 className="text-xl font-bold text-primary-900 dark:text-primary-100 leading-tight">
            {component.title || "Hoạt động bài học"}
          </h2>
        </div>
      </div>
      {children}
    </section>
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
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

function MediaComponent({ component, onComplete }) {
  const { config } = component;
  return (
    <ComponentFrame component={component}>
      <VideoScene
        src={config.url}
        badge={config.badge}
        title={config.title || component.title}
        subtitle={config.subtitle}
      />
      {config.description && <p className="text-gray-700 dark:text-primary-150 leading-relaxed">{config.description}</p>}
      <ContinueButton onComplete={onComplete} label="Tôi đã xem xong" />
    </ComponentFrame>
  );
}

function DialogueComponent({ component, onComplete }) {
  const lines = (component.config.lines || component.config.dialogs || []).map((line) => ({
    who: line.who || "guide",
    text: line.text,
  }));
  return (
    <ComponentFrame component={component}>
      <div className="bg-gray-50 dark:bg-primary-950/30 rounded-3xl border border-gray-200 dark:border-primary-850 p-5">
        <DialogueSequence lines={lines} onComplete={() => onComplete({ score: 100, status: "completed" })} ctaLabel="Tiếp tục" />
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
      <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-primary-100">{component.config.question}</p>
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
                  ? "border-green-500 bg-green-50 text-green-900"
                  : wrong
                  ? "border-red-500 bg-primary-50 dark:bg-primary-900/35 text-primary-850 dark:text-primary-100"
                  : "border-gray-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 bg-white dark:bg-[#002b37]"
              }`}
            >
              <span className="material-symbols-outlined text-xl shrink-0">
                {correctVisible ? "check_circle" : wrong ? "cancel" : "radio_button_unchecked"}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`mt-4 border p-4 rounded-3xl ${solved ? "bg-green-50 border-green-200" : "bg-primary-50 dark:bg-primary-900/35 border-primary-200 dark:border-primary-800"}`}>
          <p className={`font-bold flex items-center gap-2 mb-1 ${solved ? "text-green-800" : "text-primary-700 dark:text-primary-250"}`}>
            <span className="material-symbols-outlined text-base">{solved ? "lightbulb" : "error"}</span>
            {solved ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-primary-100">
            {selected.explanation || (solved ? component.feedback?.correct : component.feedback?.incorrect) || component.config.explanation}
          </p>
          {solved && <ContinueButton onComplete={() => onComplete({ score: 100, attempts: wrongIds.length + 1, answer: selectedId, status: "completed" })} label="Tiếp tục" />}
        </div>
      )}
    </ComponentFrame>
  );
}

function TrueFalseComponent({ component, onComplete }) {
  const [picked, setPicked] = useState(null);
  const correct = picked === component.config.correctAnswer;
  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg text-gray-900 dark:text-primary-100 mb-4">{component.config.statement}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setPicked(value)}
            className={`rounded-3xl border-2 px-5 py-4 font-bold transition-colors ${
              picked === value
                ? value === component.config.correctAnswer
                  ? "border-green-500 bg-green-50 text-green-900"
                  : "border-red-500 bg-red-50 text-red-900"
                : "border-gray-200 bg-white dark:bg-[#002b37] hover:border-primary-400"
            }`}
          >
            {value ? "Đúng" : "Sai"}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className={`mt-4 rounded-3xl border p-4 ${correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`font-bold ${correct ? "text-green-800" : "text-red-800"}`}>{correct ? "Chính xác" : "Chưa đúng"}</p>
          <p className="text-sm text-gray-800 leading-relaxed mt-1">{component.config.explanation}</p>
          {correct && <ContinueButton onComplete={() => onComplete({ score: 100, answer: picked, status: "completed" })} label="Tiếp tục" />}
        </div>
      )}
    </ComponentFrame>
  );
}

function MatchingColumnsComponent({ component, onComplete }) {
  const { leftColumn = [], rightColumn = [], correctPairs = [] } = component.config;
  const [activeLeft, setActiveLeft] = useState(null);
  const [pairs, setPairs] = useState({});
  const expected = Object.fromEntries(correctPairs.map((pair) => [pair.leftId, pair.rightId]));
  const complete = leftColumn.length > 0 && leftColumn.every((left) => pairs[left.id] === expected[left.id]);

  const chooseRight = (rightId) => {
    if (!activeLeft) return;
    setPairs((prev) => ({ ...prev, [activeLeft]: rightId }));
    setActiveLeft(null);
  };

  return (
    <ComponentFrame component={component}>
      <p className="text-sm text-gray-500 dark:text-primary-350 mb-4">Chọn một khái niệm bên trái, rồi chọn mô tả đúng ở bên phải.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftColumn.map((left) => (
            <button
              key={left.id}
              type="button"
              onClick={() => setActiveLeft(left.id)}
              className={`w-full rounded-3xl border-2 px-4 py-3 text-left font-semibold ${
                activeLeft === left.id ? "border-primary-600 bg-primary-50" : pairs[left.id] === expected[left.id] ? "border-green-500 bg-green-50" : "border-gray-200 bg-white dark:bg-[#002b37]"
              }`}
            >
              {left.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightColumn.map((right) => (
            <button
              key={right.id}
              type="button"
              onClick={() => chooseRight(right.id)}
              className="w-full rounded-3xl border-2 border-gray-200 bg-white dark:bg-[#002b37] px-4 py-3 text-left hover:border-primary-400"
            >
              {right.text}
            </button>
          ))}
        </div>
      </div>
      {complete && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-3xl p-4">
          <p className="font-bold text-green-800">Các cặp nối đã chính xác.</p>
          <ContinueButton onComplete={() => onComplete({ score: 100, answer: pairs, status: "completed" })} label="Tiếp tục" />
        </div>
      )}
    </ComponentFrame>
  );
}

function CategorySortingComponent({ component, onComplete }) {
  const { categories = [], cards = [], summary } = component.config;
  const [selectedCard, setSelectedCard] = useState(null);
  const [placements, setPlacements] = useState({});
  const complete = cards.length > 0 && cards.every((card) => placements[card.id] === card.categoryId);

  const placeCard = (categoryId) => {
    if (!selectedCard) return;
    setPlacements((prev) => ({ ...prev, [selectedCard]: categoryId }));
    setSelectedCard(null);
  };

  return (
    <ComponentFrame component={component}>
      <p className="text-sm text-gray-500 dark:text-primary-350 mb-4">Chọn một thẻ, sau đó chọn hộp phân loại phù hợp.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {cards.map((card) => {
          const placed = placements[card.id];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCard(card.id)}
              className={`px-4 py-2 rounded-3xl border-2 font-semibold ${
                selectedCard === card.id ? "border-primary-600 bg-primary-50" : placed === card.categoryId ? "border-green-500 bg-green-50 text-green-900" : placed ? "border-red-400 bg-red-50 text-red-900" : "border-gray-200 bg-white dark:bg-[#002b37]"
              }`}
            >
              {card.text}
            </button>
          );
        })}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => placeCard(category.id)}
            className="min-h-28 rounded-3xl border-2 border-primary-200 bg-primary-50/60 dark:bg-primary-900/20 px-4 py-4 text-left hover:border-primary-500"
          >
            <p className="font-bold text-primary-850 dark:text-primary-100">{category.label}</p>
            <p className="text-xs text-gray-500 mt-1">
              {cards.filter((card) => placements[card.id] === category.id).map((card) => card.text).join(", ") || "Chưa có thẻ"}
            </p>
          </button>
        ))}
      </div>
      {complete && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-3xl p-4">
          <p className="font-bold text-green-800">Phân loại chính xác.</p>
          {summary && <p className="text-sm text-green-900 mt-1">{summary}</p>}
          <ContinueButton onComplete={() => onComplete({ score: 100, answer: placements, status: "completed" })} label="Tiếp tục" />
        </div>
      )}
    </ComponentFrame>
  );
}

function TargetMatchingComponent({ component, onComplete }) {
  const { targets = [], items = [], summary } = component.config;
  const [selectedItem, setSelectedItem] = useState(null);
  const [placements, setPlacements] = useState({});
  const complete = items.length > 0 && items.every((item) => placements[item.id] === item.targetId);

  const placeItem = (targetId) => {
    if (!selectedItem) return;
    setPlacements((prev) => ({ ...prev, [selectedItem]: targetId }));
    setSelectedItem(null);
  };

  return (
    <ComponentFrame component={component}>
      <p className="text-sm text-gray-500 dark:text-primary-350 mb-4">Chọn thuật ngữ, rồi chọn vùng văn minh tương ứng.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item.id)}
            className={`px-4 py-2 rounded-3xl border-2 font-bold text-lg ${
              selectedItem === item.id ? "border-primary-600 bg-primary-50" : placements[item.id] === item.targetId ? "border-green-500 bg-green-50 text-green-900" : "border-gray-200 bg-white dark:bg-[#002b37]"
            }`}
          >
            {item.text}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {targets.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => placeItem(target.id)}
            className="rounded-3xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/30 dark:to-[#002b37] px-4 py-5 text-center hover:border-primary-500"
          >
            <span className="material-symbols-outlined text-3xl text-primary-650 dark:text-primary-300">{target.icon || "public"}</span>
            <p className="font-bold text-primary-900 dark:text-primary-100">{target.label}</p>
            <p className="text-xs text-gray-500">{items.filter((item) => placements[item.id] === target.id).map((item) => item.text).join(", ")}</p>
          </button>
        ))}
      </div>
      {complete && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-3xl p-4">
          <p className="font-bold text-green-800">Bản đồ thuật ngữ đã hoàn chỉnh.</p>
          {summary && <p className="text-sm text-green-900 mt-1">{summary}</p>}
          <ContinueButton onComplete={() => onComplete({ score: 100, answer: placements, status: "completed" })} label="Tiếp tục" />
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
              onClick={() => setRevealed((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]))}
              className={`rounded-3xl border-2 p-4 text-left min-h-28 transition-colors ${
                open ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30" : "border-gray-200 bg-white dark:bg-[#002b37] hover:border-primary-400"
              }`}
            >
              <p className="font-bold text-primary-900 dark:text-primary-100">{open ? node.label : "Mảnh ghép chưa mở"}</p>
              <p className="text-sm text-gray-600 dark:text-primary-200 mt-2">{open ? node.detail : "Bấm để lật mở nội dung."}</p>
            </button>
          );
        })}
      </div>
      {complete && <ContinueButton onComplete={() => onComplete({ score: 100, answer: revealed, status: "completed" })} label="Tiếp tục" />}
    </ComponentFrame>
  );
}

function SequenceSortingComponent({ component, onComplete }) {
  const items = component.config.items || [];
  const [placed, setPlaced] = useState([]);
  const complete = items.length > 0 && placed.length === items.length;

  const pick = (item) => {
    if (placed.includes(item.id)) return;
    if ((item.order ?? items.findIndex((it) => it.id === item.id)) === placed.length) {
      setPlaced((prev) => [...prev, item.id]);
    }
  };

  return (
    <ComponentFrame component={component}>
      {component.config.instruction && <p className="text-sm text-gray-500 mb-4">{component.config.instruction}</p>}
      <div className="space-y-2 mb-4">
        {placed.map((id, index) => {
          const item = items.find((it) => it.id === id);
          return (
            <div key={id} className="flex items-center gap-3 rounded-3xl border-2 border-green-400 bg-green-50 px-4 py-3">
              <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
              <span className="text-sm text-green-900 font-medium">{item?.text}</span>
            </div>
          );
        })}
      </div>
      {!complete && (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.filter((item) => !placed.includes(item.id)).map((item) => (
            <button key={item.id} type="button" onClick={() => pick(item)} className="rounded-3xl border-2 border-gray-200 px-4 py-3 text-left hover:border-primary-400">
              {item.text}
            </button>
          ))}
        </div>
      )}
      {complete && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-3xl p-4">
          <p className="font-bold text-green-800">{component.config.successFeedback || "Sắp xếp chính xác."}</p>
          <ContinueButton onComplete={() => onComplete({ score: 100, answer: placed, status: "completed" })} label="Tiếp tục" />
        </div>
      )}
    </ComponentFrame>
  );
}

function FinalSummaryComponent({ component, onComplete }) {
  const { message, keyTakeaways = [], rewards = {}, quiz = [] } = component.config;
  const [quizDone, setQuizDone] = useState(quiz.length === 0);
  const [answers, setAnswers] = useState({});
  const answeredAll = quiz.length > 0 && quiz.every((_, index) => answers[index] !== undefined);
  const score = quiz.length === 0
    ? 100
    : Math.round((quiz.filter((q, index) => answers[index] === q.correctIndex).length / quiz.length) * 100);

  useEffect(() => {
    if (answeredAll) setQuizDone(true);
  }, [answeredAll]);

  return (
    <ComponentFrame component={component}>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5">
        <p className="text-lg font-bold text-primary-950 mb-2">{message || "Bạn đã hoàn thành bài học."}</p>
        <ul className="space-y-2">
          {keyTakeaways.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-800">
              <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">check_circle</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-800 border border-amber-200">
          <span className="material-symbols-outlined text-base">military_tech</span>
          {rewards.badge || "Hoàn thành"} · {rewards.xp || 100} XP
        </div>
      </div>

      {quiz.length > 0 && (
        <div className="mt-5 space-y-4">
          {quiz.map((question, index) => (
            <div key={index} className="rounded-3xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 mb-3">{question.question}</p>
              <div className="grid gap-2">
                {(question.options || []).map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                    className={`rounded-3xl border px-4 py-2 text-left ${
                      answers[index] === optionIndex ? "border-primary-600 bg-primary-50 font-semibold" : "border-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quizDone && <p className="text-sm font-bold text-green-700">Điểm tổng kết: {score}%</p>}
        </div>
      )}

      {quizDone && (
        <ContinueButton
          onComplete={() => onComplete({ score, answer: answers, status: "completed" })}
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
  true_false: TrueFalseComponent,
  matching_columns: MatchingColumnsComponent,
  category_sorting: CategorySortingComponent,
  target_matching: TargetMatchingComponent,
  mindmap_reveal: MindmapRevealComponent,
  sequence_sorting: SequenceSortingComponent,
  final_summary: FinalSummaryComponent,
};

export default function FlowLessonPlayer({ nodeDetails, isRevisit, onComplete }) {
  const { user } = useAuth();
  const progress = getProgress(nodeDetails?.progress);
  const flow = useMemo(() => (Array.isArray(nodeDetails?.lessonFlow) ? nodeDetails.lessonFlow : []), [nodeDetails]);
  const initialIndex = isRevisit ? 0 : Math.min(progress?.currentComponentIndex || 0, Math.max(flow.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState(() => Array.isArray(progress?.completedComponentIds) ? progress.completedComponentIds : []);
  const updateComponentProgress = useUpdateComponentProgressMutation();

  useEffect(() => {
    setActiveIndex(initialIndex);
    setCompletedIds(Array.isArray(progress?.completedComponentIds) ? progress.completedComponentIds : []);
  }, [nodeDetails?.id, initialIndex, progress?.completedComponentIds]);

  if (!flow.length) {
    return (
      <ComponentFrame component={{ type: "lesson_flow", title: "Bài học chưa có nội dung", config: {} }}>
        <p className="text-gray-600">Lesson Flow chưa được cấu hình cho bài học này.</p>
      </ComponentFrame>
    );
  }

  const activeComponent = flow[activeIndex];
  const Renderer = registry[activeComponent.type];
  const percentage = Math.round(((completedIds.length + (completedIds.includes(activeComponent.id) ? 0 : 0)) / flow.length) * 100);

  const markComplete = (result = {}) => {
    const nextCompletedIds = completedIds.includes(activeComponent.id)
      ? completedIds
      : [...completedIds, activeComponent.id];
    const nextIndex = Math.min(activeIndex + 1, flow.length - 1);
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

    if (nextCompletedIds.length >= flow.length) {
      onComplete?.();
      return;
    }
    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 dark:border-primary-850 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Component Flow</p>
            <p className="font-bold text-primary-850 dark:text-primary-100">
              Bước {activeIndex + 1}/{flow.length}: {activeComponent.title || activeComponent.type}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-600 border border-gray-200 hover:border-primary-600 transition-all"
            title="Về bước đầu"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {Renderer ? (
        <Renderer key={activeComponent.id} component={activeComponent} onComplete={markComplete} />
      ) : (
        <ComponentFrame component={activeComponent}>
          <p className="text-red-700">Component type "{activeComponent.type}" chưa có renderer.</p>
        </ComponentFrame>
      )}
    </div>
  );
}
