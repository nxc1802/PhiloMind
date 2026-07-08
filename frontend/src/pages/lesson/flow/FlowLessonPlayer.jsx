import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateComponentProgressMutation } from "../../../hooks/useMutations";
import { normalizeFlow } from "./utils/normalizeFlow";
import { ProgressBar } from "../components/ProgressBar";
import { CenterMedia } from "../components/CenterMedia";
import { RightInteractive } from "../components/RightInteractive";

function getProgress(progress) {
  return Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
}

import { MilestoneBar } from "../components/MilestoneBar";

function mediaFromComponent(component) {
  if (component?.type !== "media" || !component.config?.url) return null;

  return {
    id: component.id,
    type: component.config.mediaType || "video",
    url: component.config.url,
    title: component.config.title || component.title,
    subtitle: component.config.subtitle,
    alt: component.config.alt,
    description: component.config.description,
    badge: component.config.badge,
    width: component.config.width,
    height: component.config.height,
    minWidth: component.config.minWidth,
    minHeight: component.config.minHeight,
    maxWidth: component.config.maxWidth,
    maxHeight: component.config.maxHeight,
    aspectRatio: component.config.aspectRatio || component.config.ratio,
    fit: component.config.fit,
    position: component.config.position,
    align: component.config.align,
    size: component.config.size,
    display: component.config.display,
    layout: component.config.layout,
  };
}

function getLinkedMediaId(component) {
  return (
    component?.linkedMediaId ||
    component?.linked_media_id ||
    component?.config?.linkedMediaId ||
    component?.config?.linked_media_id ||
    null
  );
}

function findFlowIndexByComponentId(flow, componentId) {
  if (!componentId) return -1;
  return flow.findIndex((component) => {
    if (component.id === componentId) return true;
    const children = component.config?.components;
    return (
      component.type === "component_group" &&
      Array.isArray(children) &&
      children.some((child) => child?.id === componentId)
    );
  });
}

function getComponentResults(progress) {
  return Array.isArray(progress?.componentResults)
    ? progress.componentResults
    : [];
}

function mergeComponentResults(currentResults, incomingResults) {
  if (!Array.isArray(incomingResults) || incomingResults.length === 0) {
    return Array.isArray(currentResults) ? currentResults : [];
  }

  const byId = new Map(
    (Array.isArray(currentResults) ? currentResults : [])
      .filter((result) => result?.componentId)
      .map((result) => [result.componentId, result]),
  );

  incomingResults.forEach((result) => {
    if (!result?.componentId) return;
    const existing = byId.get(result.componentId);
    const existingChildCount = Array.isArray(existing?.childResults)
      ? existing.childResults.length
      : 0;
    const incomingChildCount = Array.isArray(result?.childResults)
      ? result.childResults.length
      : 0;

    byId.set(
      result.componentId,
      existingChildCount > incomingChildCount
        ? { ...result, childResults: existing.childResults }
        : result,
    );
  });

  return Array.from(byId.values());
}

function upsertComponentResult(results, componentResult) {
  if (!componentResult?.componentId) {
    return Array.isArray(results) ? results : [];
  }

  return [
    ...(Array.isArray(results) ? results : []).filter(
      (result) => result?.componentId !== componentResult.componentId,
    ),
    componentResult,
  ];
}

export default function FlowLessonPlayer({
  nodeDetails,
  isRevisit,
  onComplete,
  flatSyllabusItems,
  progressStats,
  lessonSlug,
  handleSyllabusClick,
}) {
  const { user } = useAuth();
  const progress = getProgress(nodeDetails?.progress);

  // 1. Flow Normalization
  const flow = useMemo(
    () => normalizeFlow(nodeDetails?.lessonFlow),
    [nodeDetails?.lessonFlow],
  );

  // 2. Media Extraction
  // lessonMedia drives the center column. Media components are still accepted
  // for backward-compatible seed data, but are not rendered in the right column.
  const flowMedia = useMemo(
    () => flow.map(mediaFromComponent).filter(Boolean),
    [flow],
  );

  const lessonMedia = useMemo(() => {
    const fromNode = Array.isArray(nodeDetails?.lessonMedia)
      ? nodeDetails.lessonMedia
      : [];
    const seen = new Set();
    return [...fromNode, ...flowMedia].filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [flowMedia, nodeDetails?.lessonMedia]);

  const progressItems = useMemo(
    () => flow.map((component, index) => ({ component, index })),
    [flow],
  );

  const mediaIdByIndex = useMemo(() => {
    const mediaIds = new Map();
    let currentMediaId = lessonMedia[0]?.id || null;

    flow.forEach((component, index) => {
      const linkedMediaId = getLinkedMediaId(component);
      if (linkedMediaId) {
        currentMediaId = linkedMediaId;
      } else if (component.type === "media") {
        currentMediaId = component.id;
      }
      mediaIds.set(index, currentMediaId);
    });

    return mediaIds;
  }, [flow, lessonMedia]);

  const getMediaIdForIndex = (index) => {
    const component = flow[index];
    const linkedMediaId = getLinkedMediaId(component);
    if (linkedMediaId) return linkedMediaId;
    if (component?.type === "media") return component.id;
    return mediaIdByIndex.get(index) || lessonMedia[0]?.id || null;
  };

  // 3. State Management
  const progressActiveIndex = findFlowIndexByComponentId(
    flow,
    progress?.activeComponentId,
  );
  const initialIndex = isRevisit
    ? 0
    : Math.min(
        progressActiveIndex >= 0
          ? progressActiveIndex
          : progress?.currentComponentIndex || 0,
        Math.max(flow.length - 1, 0),
      );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState(() =>
    Array.isArray(progress?.completedComponentIds)
      ? progress.completedComponentIds
      : [],
  );
  const progressComponentResults = useMemo(
    () => getComponentResults(progress),
    [progress?.componentResults],
  );
  const [componentResults, setComponentResults] = useState(
    progressComponentResults,
  );
  const [activeMediaId, setActiveMediaId] = useState(lessonMedia[0]?.id);

  const updateComponentProgress = useUpdateComponentProgressMutation();

  const activeMediaForIndex = useMemo(
    () => getMediaIdForIndex(activeIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, flow, lessonMedia, mediaIdByIndex],
  );

  useEffect(() => {
    if (activeMediaForIndex) {
      setActiveMediaId(activeMediaForIndex);
    } else {
      setActiveMediaId(null);
    }
  }, [activeMediaForIndex]);

  // Reset state on node change
  useEffect(() => {
    setActiveIndex(initialIndex);
    setCompletedIds(
      Array.isArray(progress?.completedComponentIds)
        ? progress.completedComponentIds
        : [],
    );
    setComponentResults(progressComponentResults);
    setActiveMediaId(getMediaIdForIndex(initialIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDetails?.id, lessonMedia]);

  useEffect(() => {
    setComponentResults((currentResults) =>
      mergeComponentResults(currentResults, progressComponentResults),
    );
  }, [progressComponentResults]);

  // 4. Progress Handlers
  const handleCompleteComponent = (
    activeComponent,
    currentSafeIndex,
    result = {},
  ) => {
    const nextCompletedIds = completedIds.includes(activeComponent.id)
      ? completedIds
      : [...completedIds, activeComponent.id];

    const nextIndex = Math.min(currentSafeIndex + 1, flow.length - 1);

    const componentResult = {
      componentId: activeComponent.id,
      type: activeComponent.type,
      status: "completed",
      ...result,
    };

    setCompletedIds(nextCompletedIds);
    setComponentResults((currentResults) =>
      upsertComponentResult(currentResults, componentResult),
    );

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

    if (currentSafeIndex < flow.length - 1) {
      setActiveIndex(nextIndex);
    }
  };

  const handleUpdateComponentResult = (
    activeComponent,
    currentSafeIndex,
    result = {},
  ) => {
    const componentResult = {
      componentId: activeComponent.id,
      type: activeComponent.type,
      status: "in_progress",
      ...result,
    };

    setComponentResults((currentResults) =>
      upsertComponentResult(currentResults, componentResult),
    );

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: activeComponent.id,
        currentComponentIndex: currentSafeIndex,
        completedComponentIds: completedIds,
        componentResult,
      },
    });
  };

  const handleSelectComponent = (index) => {
    setActiveIndex(index);
  };

  const handleSelectMedia = (mediaId) => {
    setActiveMediaId(mediaId);
  };

  const handleResetLesson = () => {
    const firstComponent = flow[0];
    if (!firstComponent || !nodeDetails?.id) return;

    setCompletedIds([]);
    setComponentResults([]);
    setActiveIndex(0);
    setActiveMediaId(getMediaIdForIndex(0));

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: firstComponent.id,
        currentComponentIndex: 0,
        completedComponentIds: [],
        componentResults: [],
        resetLessonProgress: true,
      },
    });
  };

  // Bố cục hai cột được KHOÁ CỨNG 50/50 (flex-1). Cơ chế kéo–thả chỉnh độ rộng
  // đã bị gỡ bỏ hoàn toàn vì trước đây là nguyên nhân khiến cột video bị phóng
  // hết cỡ và vỡ giao diện cột phải. Không còn state/handler kéo nào ở đây.
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0D1117]">
      <div className="flex w-full min-w-0 items-center gap-2 px-3 pt-3">
        <div className="min-w-0 flex-1">
          <ProgressBar
            progressItems={progressItems}
            activeIndex={activeIndex}
            completedIds={completedIds}
            onSelectComponent={handleSelectComponent}
          />
        </div>
        <button
          type="button"
          onClick={handleResetLesson}
          disabled={updateComponentProgress.isPending || flow.length === 0}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-650 disabled:cursor-wait disabled:opacity-60 dark:border-transparent dark:bg-slate-900/55 dark:text-primary-250 dark:hover:bg-primary-900/30"
          title="Học lại bài này từ đầu"
          aria-label="Học lại bài này từ đầu"
        >
          <span className="material-symbols-outlined text-[20px]">
            restart_alt
          </span>
        </button>
      </div>
      <div className="flex flex-1 min-h-0 w-full min-w-0 p-3 gap-3 overflow-hidden">
        {/* Left Column: Center Media — bố cục khoá cứng, chiếm đúng một nửa */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-transparent dark:bg-surface-dark-elevated">
          <MilestoneBar
            flow={flow}
            completedIds={completedIds}
            activeIndex={activeIndex}
          />
          <CenterMedia
            lessonMedia={lessonMedia}
            activeMediaId={activeMediaId}
            onSelectMedia={handleSelectMedia}
          />
        </div>

        {/* Right Column: Interactive Content — nửa còn lại.
            Không còn divider: hai cột cách nhau đúng bằng gap-3 (12px), khớp
            với khoảng cách dọc giữa thanh tiến trình và khung bài học (p-3). */}
        <div className="relative h-full min-h-0 min-w-0 flex-1 basis-0">
          <RightInteractive
            flow={flow}
            activeIndex={activeIndex}
            completedIds={completedIds}
            componentResults={componentResults}
            onCompleteComponent={handleCompleteComponent}
            onUpdateComponentResult={handleUpdateComponentResult}
            onFinishLesson={onComplete}
          />
        </div>
      </div>
    </div>
  );
}
