import React, { useEffect, useMemo, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
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

  const readyToComplete =
    children.length > 0 &&
    (completionMode === "any"
      ? childResults.some((result) => result?.status === "completed")
      : children.every((child) => completedChildIds.has(child.id)));

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
      <ComponentFrame component={component}>
        <p className="font-bold">Cụm hoạt động này chưa có component con.</p>
        <ContinueButton onComplete={onComplete} label="Bỏ qua cụm này" />
      </ComponentFrame>
    );
  }

  return (
    <ComponentFrame component={component}>
      <div className="min-h-0 flex-1 space-y-4">
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
              className={`animate-[fadeIn_220ms_ease-out] ${
                index > 0
                  ? "border-t border-slate-100 pt-4 dark:border-white/10"
                  : ""
              }`}
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
            </div>
          );
        })}

        {readyToComplete && (
          <ContinueButton
            onComplete={() => completeGroup(childResults)}
            label="Tiếp tục"
          />
        )}
      </div>
    </ComponentFrame>
  );
}
