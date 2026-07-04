import React, { useEffect, useMemo, useState } from "react";
import { ContinueButton } from "./ContinueButton";
import { getComponentName, getComponentRenderer } from "./componentRegistry";

function getSavedChildResults(componentResults, component) {
  const parentResult = (componentResults || []).find(
    (result) => result?.componentId === component.id,
  );
  if (Array.isArray(parentResult?.childResults)) {
    return parentResult.childResults;
  }

  const childIds = new Set(
    (component.config?.components || [])
      .map((child) => child?.id)
      .filter(Boolean),
  );
  return (componentResults || []).filter((result) =>
    childIds.has(result?.componentId),
  );
}

function upsertChildResult(results, child, result) {
  const nextResult = {
    componentId: child.id,
    type: child.type,
    status: "completed",
    ...result,
  };

  return [
    ...results.filter((item) => item?.componentId !== child.id),
    nextResult,
  ];
}

function getAverageScore(results) {
  const scored = results
    .map((result) => result?.score)
    .filter((score) => typeof score === "number");
  if (scored.length === 0) return 100;
  return Math.round(
    scored.reduce((sum, score) => sum + score, 0) / scored.length,
  );
}

export function ComponentGroupComponent({
  component,
  onComplete,
  onUpdate,
  componentResults = [],
}) {
  const children = useMemo(
    () =>
      Array.isArray(component.config?.components)
        ? component.config.components.filter(Boolean)
        : [],
    [component.config?.components],
  );
  const revealMode = component.config?.revealMode || "sequential";
  const completionMode = component.config?.completionMode || "all";
  const savedChildResults = useMemo(
    () => getSavedChildResults(componentResults, component),
    [component, componentResults],
  );
  const [childResults, setChildResults] = useState(savedChildResults);

  useEffect(() => {
    setChildResults(savedChildResults);
  }, [savedChildResults]);

  const completedChildIds = useMemo(
    () =>
      new Set(
        childResults
          .filter((result) => result?.status === "completed")
          .map((result) => result.componentId),
      ),
    [childResults],
  );

  const visibleChildren =
    revealMode === "all"
      ? children
      : children.slice(
          0,
          Math.min(children.length, completedChildIds.size + 1),
        );

  const completeGroup = (nextChildResults) => {
    onComplete({
      status: "completed",
      score: getAverageScore(nextChildResults),
      childResults: nextChildResults,
      completedChildren: nextChildResults.length,
      totalChildren: children.length,
    });
  };

  const handleChildComplete = (child, result = {}) => {
    if (completedChildIds.has(child.id)) return;

    const nextChildResults = upsertChildResult(childResults, child, result);
    const nextCompletedIds = new Set(
      nextChildResults
        .filter((item) => item?.status === "completed")
        .map((item) => item.componentId),
    );
    const allCompleted = children.every((item) =>
      nextCompletedIds.has(item.id),
    );
    const shouldComplete =
      completionMode === "any" ? nextChildResults.length > 0 : allCompleted;

    setChildResults(nextChildResults);

    if (shouldComplete) {
      completeGroup(nextChildResults);
      return;
    }

    onUpdate?.({
      status: "in_progress",
      score: getAverageScore(nextChildResults),
      childResults: nextChildResults,
      completedChildren: nextChildResults.length,
      totalChildren: children.length,
    });
  };

  if (children.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm dark:border-primary-850 dark:bg-[#0f2530] dark:text-primary-100">
        <p className="font-bold">Cụm hoạt động này chưa có component con.</p>
        <ContinueButton onComplete={onComplete} label="Bỏ qua cụm này" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 shrink-0 rounded-2xl border border-primary-100 bg-white px-4 py-3 shadow-sm dark:border-primary-850 dark:bg-[#0f2530]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-650 dark:bg-primary-900/35 dark:text-primary-300">
            view_agenda
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
              component group
            </p>
            <h2 className="truncate text-base font-bold text-primary-900 dark:text-primary-100">
              {component.title || "Cụm hoạt động"}
            </h2>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {visibleChildren.map((child, index) => {
          const Renderer = getComponentRenderer(child.type);
          const childResult = childResults.find(
            (result) => result?.componentId === child.id,
          );
          const isDone = childResult?.status === "completed";
          const embeddedChild = {
            ...child,
            __isEmbedded: true,
            __isCompleted: isDone,
            __completedResult: childResult,
          };

          return (
            <div
              key={child.id}
              className="animate-[fadeIn_220ms_ease-out]"
              data-group-child-id={child.id}
            >
              {Renderer ? (
                <Renderer
                  component={embeddedChild}
                  componentResults={componentResults}
                  onComplete={(result) => handleChildComplete(child, result)}
                />
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100">
                  Component con "{child.type}" chưa có renderer (
                  {getComponentName(child.type)}).
                </div>
              )}
              {isDone && index < children.length - 1 && (
                <div className="mt-2 flex items-center justify-end gap-2 pr-2 text-xs font-bold text-primary-600 dark:text-primary-300">
                  <span>Hoàn thành</span>
                  <span className="material-symbols-outlined text-base">
                    keyboard_double_arrow_down
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
