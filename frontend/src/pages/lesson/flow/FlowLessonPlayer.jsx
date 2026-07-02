import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateComponentProgressMutation } from "../../../hooks/useMutations";
import { normalizeFlow } from "./utils/normalizeFlow";
import { LeftPanel } from "../components/LeftPanel";
import { CenterMedia } from "../components/CenterMedia";
import { RightInteractive } from "../components/RightInteractive";

function getProgress(progress) {
  return Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
}

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

function isVisibleMilestone(component) {
  const navConfig =
    component?.navigationConfig ||
    component?.navigation_config ||
    component?.config?.navigationConfig ||
    component?.config?.navigation_config;

  return navConfig?.showInProgress !== false;
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
    () =>
      flow
        .map((component, index) => ({ component, index }))
        .filter(({ component }) => isVisibleMilestone(component)),
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
    setActiveMediaId(getMediaIdForIndex(initialIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDetails?.id, lessonMedia]);

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

  const handleSelectComponent = (index) => {
    setActiveIndex(index);
  };

  const handleSelectMedia = (mediaId) => {
    setActiveMediaId(mediaId);
  };

  // 5. Layout Rendering
  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[205px_minmax(0,1fr)_312px] 2xl:grid-cols-[252px_minmax(0,1fr)_384px]">
      {/* Cột 1: Left Panel */}
      <div className="relative z-10 hidden h-full min-h-0 lg:block">
        <LeftPanel
          flatSyllabusItems={flatSyllabusItems}
          progressStats={progressStats}
          lessonSlug={lessonSlug}
          handleSyllabusClick={handleSyllabusClick}
          currentNodeDetails={nodeDetails}
          progressItems={progressItems}
          activeIndex={activeIndex}
          completedIds={completedIds}
          onSelectComponent={handleSelectComponent}
        />
      </div>

      {/* Cột 2: Center Media */}
      <div className="relative z-0 hidden h-full min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-primary-850/50 dark:bg-surface-dark-elevated lg:block">
        <CenterMedia
          lessonMedia={lessonMedia}
          activeMediaId={activeMediaId}
          onSelectMedia={handleSelectMedia}
        />
      </div>

      <RightInteractive
        flow={flow}
        activeIndex={activeIndex}
        completedIds={completedIds}
        onCompleteComponent={handleCompleteComponent}
        onFinishLesson={onComplete}
      />
    </div>
  );
}
